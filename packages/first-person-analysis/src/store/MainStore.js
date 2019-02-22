/**
 * Creates a new instance of MainStore.
 * @class
 * @returns An instance of MainStore.
 * @example
 * var instance = new MainStore();
 */
import UiStore from "./UiStore";
import TargetStore from "./TargetStore";
import ReadingsStore from "./ReadingsStore";

export default class MainStore {
    sceneData;
    constructor() {
        this.uiStore = new UiStore();
        this.targetStore = new TargetStore();
        this.readingsStore = new ReadingsStore();
    };
}
