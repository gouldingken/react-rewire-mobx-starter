import {action, autorun, decorate, observable} from "mobx";

/**
 * Creates a new instance of UiStore.
 * @class
 * @returns An instance of UiStore.
 * @example
 * var instance = new UiStore();
 */

const width = 720;
export default class UiStore {
    selectedMinute = 0;
    selectedPosition = {x: 0, y: 0};
    canvasSize = {width: width, height: width * 1000/1942};
    constructor() {
    };

    setSelectedMinute(val) {
        this.selectedMinute = val;
    }
    setSelectedPosition(x,y) {
        this.selectedPosition.x = x;
        this.selectedPosition.y = y;
    }
}


decorate(UiStore, {
    selectedMinute: observable,
    selectedPosition: observable,
    setSelectedMinute: action,
    setSelectedPosition: action,
});
