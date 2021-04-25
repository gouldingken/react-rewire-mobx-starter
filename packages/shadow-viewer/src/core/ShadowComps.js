/**
 * Creates a new instance of ShadowComps.
 * @class
 * @returns An instance of ShadowComps.
 * @example
 * var instance = new ShadowComps();
 */
import BitMaskSet from "./BitMaskSet.js";

export default class ShadowComps {

    constructor() {
        this.bitMaskSets = {};
    };

    async loadMetaData() {
        const response = await fetch('data/jsonData.json');
        return await response.json();
    }

    async loadFiles() {
        this.metadata = await this.loadMetaData();
        this.metadata.bitMasks.forEach((bitMask, i) => {
            const bitMaskSet = new BitMaskSet('data/' + bitMask.id);
            this.bitMaskSets[bitMask.id] = bitMaskSet;
            bitMaskSet.loadFiles(this.metadata.imageList);
        });
    }

}
