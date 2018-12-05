import {observable, action, decorate} from "mobx";
import {InteractionStore} from "react-timeline-gantt";

/**
 * Creates a new instance of MainStore.
 * @class
 * @returns An instance of MainStore.
 * @example
 * var instance = new MainStore();
 */
export default class MainStore {
    activeOption = 'Option 1';
    previousOption = 'Option 1';
    moveSets = [];

    constructor() {
        this.timelineInteractionStore = new InteractionStore();
    };

    setActiveOption(val) {
        if (this.activeOption === val) return;
        this.previousOption = this.activeOption;
        this.activeOption = val;
    }
    setMoveSets(val) {
        this.moveSets = val;
    }
}

decorate(MainStore, {
    previousOption: observable,
    activeOption: observable,
    moveSets: observable,

    setActiveOption: action,
    setMoveSets: action,
});
