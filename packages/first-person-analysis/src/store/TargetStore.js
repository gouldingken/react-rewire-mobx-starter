import {action, computed, decorate, observable} from "mobx";
import ReadingsStore from "./ReadingsStore";

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
                currentPoint: {available: 0, unobstructed: 0}
            };
        }
        return this.viewTargets[targetId];
    }

    get maxVisibleValue() {
        let max = 0;
        Object.keys(this.viewTargets).forEach((k) => {
            max = Math.max(max, this.viewTargets[k].currentPoint.available);
        });
        return max;
    }

    deleteTargetObjects(targetId, deleter) {
        const viewTarget = this.getViewTarget(targetId);
        if (viewTarget && viewTarget.threeObjects) {
            deleter(viewTarget.threeObjects);
        }
    }

    setTargetObjects(targetId, threeObjects) {
        const viewTarget = this.getViewTarget(targetId);
        viewTarget.threeObjects = threeObjects;
        if (threeObjects.length > 0 && threeObjects[0].userData) {
            const meta = threeObjects[0].userData.meta;
            viewTarget.color = meta.color;
            viewTarget.name = meta.name;
        }
        threeObjects.forEach((obj, i) => {
            obj.userData.isViewTarget = true;
            if (!obj.userData.sasType) obj.userData.sasType = {};
            obj.userData.sasType.TargetObject = {targetId: targetId};
        });

    }

    setCurrentValues(sensor) {
        for (let i = 1; i <= 3; i++) {
            let viewTarget = this.getViewTarget('target' + i);
            viewTarget.currentPoint.available = sensor.values['c' + i].f / ReadingsStore.sunAreaOfFullSphere;
            viewTarget.currentPoint.unobstructed = sensor.values['c' + i].o / ReadingsStore.sunAreaOfFullSphere;
        }
    }

    getIdForChannel(c) {
        for (let i = 1; i <= 3; i++) {
            if (c === 'c' + i) return 'target' + i;
        }
        return 'missing';
    }

    get channels() {
        return {
            channel1: this.getViewTarget('target1').color,
            channel2: this.getViewTarget('target2').color,
            channel3: this.getViewTarget('target3').color,
        };
    }

    getMeta() {
        const viewTargets = {};
        Object.keys(this.viewTargets).forEach((k) => {
            const v = JSON.parse(JSON.stringify(this.viewTargets[k]));//clone
            delete v.threeObjects;
            viewTargets[k] = v;
        });
        return {
            viewTargets: viewTargets
        };
    }

    setMeta(meta, objectsBySasType) {
        this.viewTargets = meta.viewTargets;
        //reconnect scene objects based on target ids
        const objectsByTargetId = {};
        if (objectsBySasType && objectsBySasType.TargetObject) {
            objectsBySasType.TargetObject.forEach((obj, i) => {
                let targetId = obj.userData.sasType.TargetObject.targetId;
                if (!objectsByTargetId[targetId]) objectsByTargetId[targetId] = [];
                objectsByTargetId[targetId].push(obj);
            });
        }
        Object.keys(this.viewTargets).forEach((targetId) => {
            if (!objectsByTargetId[targetId]) objectsByTargetId[targetId] = [];
            this.viewTargets[targetId].threeObjects = objectsByTargetId[targetId];
        });
    }
}


decorate(TargetStore, {
    viewTargets: observable,
    channels: computed,
    setCurrentValues: action,
});
