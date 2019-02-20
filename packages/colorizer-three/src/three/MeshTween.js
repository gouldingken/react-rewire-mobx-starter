import {Group} from "three-full";
import TweenSet from "./TweenSet";

/**
 * Creates a new instance of MeshTween.
 * @class
 * @returns An instance of MeshTween.
 * @example
 * var instance = new MeshTween();
 */
export default class MeshTween {

    constructor(scene, name) {
        this.tickCount = 0;
        this.tickFrequency = 2;
        this.group = new Group();
        this.tweenSets = {};
        this.activeTweenSet = null;
        this.name = name;
        scene.add(this.group);
    };

    static orderedId(a, b) {
        if (a > b) return b + '_' + a;
        return a + '_' + b;
    }

    add(mesh, fromKey, toKey) {
        //TODO start/end meshes are currently duplicated across tweens - consider storing only once
        const tweenSetId = MeshTween.orderedId(fromKey, toKey);
        if (!this.tweenSets[tweenSetId]) {
            this.tweenSets[tweenSetId] = new TweenSet(fromKey, toKey);
        }
        this.tweenSets[tweenSetId].add(mesh);
        if (mesh) {
            this.group.add(mesh);
        }
    }

    setTweenSet(fromKey, toKey, activate) {
        const tweenSetId = MeshTween.orderedId(fromKey, toKey);
        let activeTweenSet = this.tweenSets[tweenSetId];
        if (activate) {
            this.activeTweenSet = activeTweenSet;
            if (this.activeTweenSet) {
                this.activeTweenSet.setActiveKey(toKey);
            }
        }
        Object.keys(this.tweenSets).forEach((k) => {
            const tweenSet = this.tweenSets[k];
            tweenSet.setVisible(tweenSet === activeTweenSet);
        });
    }

    tick() {
        if (!this.activeTweenSet) return;
        this.tickCount++;
        if (this.tickCount % this.tickFrequency === 0) {
            this.activeTweenSet.tick();
        }
    }

}
