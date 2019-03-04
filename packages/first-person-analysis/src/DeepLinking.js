import {autorun} from "mobx";
/**
 * Creates a new instance of DeepLinking.
 * @class
 * @returns An instance of DeepLinking.
 * @example
 * var instance = new DeepLinking();
 */
import {DeepLinks} from "sasaki-core";

export default class DeepLinking extends DeepLinks {

    constructor(store) {
        super();
        this.store = store;
        const {uiStore} = store;
        autorun(() => {
            // console.log('AUTORUN '+JSON.stringify(targetStore.viewTargets))
            const hashData = {
                selectedReviewTarget: uiStore.selectedReviewTarget,
                valueRampMultiplier: uiStore.valueRampMultiplier,
                pointOptions: uiStore.pointOptions,
                pointCloudOptions: uiStore.pointCloudOptions,
                surfaceOptions: uiStore.surfaceOptions,
                blockersVisible: uiStore.blockersVisible,
            };
            this.setHashData(hashData);
        });
    };

    onData(hashData) {
        this.store.uiStore.setMeta(hashData);
    }
}
