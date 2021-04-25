import {NwInterop} from "speckle-direct";
import {SketchupInterop} from "speckle-direct";
import {BasicInterop} from "speckle-direct";
import UiStore from "./UiStore";

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
    };

}
