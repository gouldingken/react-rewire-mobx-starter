/**
 * Creates a new instance of MainStore.
 * @class
 * @returns An instance of MainStore.
 * @example
 * var instance = new MainStore();
 */
import UiStore from "./UiStore";

export default class MainStore {
    sceneData;
    constructor() {
        this.uiStore = new UiStore();
    };
}
