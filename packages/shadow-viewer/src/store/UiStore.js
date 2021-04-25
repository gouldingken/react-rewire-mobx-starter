import {action, autorun, decorate, observable} from "mobx";

/**
 * Creates a new instance of UiStore.
 * @class
 * @returns An instance of UiStore.
 * @example
 * var instance = new UiStore();
 */
export default class UiStore {
    selectedMinute = 0;
    constructor() {
    };

    setSelectedMinute(val) {
        this.selectedMinute = val;
    }
}


decorate(UiStore, {
    selectedMinute: observable,
    setSelectedMinute: action,
});
