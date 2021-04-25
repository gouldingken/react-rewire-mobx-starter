import {NwInterop} from "speckle-direct";
import {SketchupInterop} from "speckle-direct";
import {BasicInterop} from "speckle-direct";
import UiStore from "./UiStore";
import ShadowComps from "../core/ShadowComps";
import {decorate, computed} from "mobx";

/**
 * Creates a new instance of MainStore.
 * @class
 * @returns An instance of MainStore.
 * @example
 * var instance = new MainStore();
 */

export default class MainStore {

    constructor() {
        this.uiStore = new UiStore();
        this.shadowComps = new ShadowComps();
        this.shadowComps.loadFiles().then(() => {

        });
    };

    get bitmaskData() {
        const dataById = {};
        const {x, y} = this.uiStore.selectedPosition;
        Object.keys(this.shadowComps.bitMaskSets).forEach((id) => {
            const bitMaskSet = this.shadowComps.bitMaskSets[id];
            const shadowsBitmask = bitMaskSet.getShadowsBitmask(x, y);
            const count = (shadowsBitmask.match(/1/g) || []).length;
            const hrs = count * 3 / 60;
            dataById[id] = {hrs, shadowsBitmask};
            // document.getElementById(id).innerText = `${(hrs)} hrs: ${shadowsBitmask}`;
        });
        return dataById;
    }

}

decorate(MainStore, {
    bitmaskData: computed,
});
