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


    constructor() {
        this.timelineInteractionStore = new InteractionStore();
    };

    setActiveOption(val) {
        this.activeOption = val;
    }
}


decorate(MainStore, {
    activeOption: observable,

    setActiveOption: action,
});
