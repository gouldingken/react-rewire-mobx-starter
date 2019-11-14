import UiStore from "./UiStore";
import TargetStore from "./TargetStore";
import ReadingsStore from "./ReadingsStore";
import OptionsStore from "./OptionsStore";
import {NwInterop} from "speckle-direct";
import {SketchupInterop} from "speckle-direct";
import {BasicInterop} from "speckle-direct";

/**
 * Creates a new instance of MainStore.
 * @class
 * @returns An instance of MainStore.
 * @example
 * var instance = new MainStore();
 */
export default class MainStore {
    sceneData;
    constructor() {
        this.uiStore = new UiStore();
        this.targetStore = new TargetStore();
        this.optionsStore = new OptionsStore();
        this.readingsStore = new ReadingsStore(this.optionsStore, this.targetStore);
    };

    getInterop() {
        if (SketchupInterop.supported) {
            return new SketchupInterop();
        }
        if (NwInterop.supported) {//nwjs environment
            return new NwInterop();
        }
        return new BasicInterop();
    }
}
