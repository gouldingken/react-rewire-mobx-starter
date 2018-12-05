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
    activeOption = 'Option 2';
    previousOption = 'Existing';
    moveSets = [];
    inclusionList = [];

    constructor() {
        this.timelineInteractionStore = new InteractionStore();
    };

    setActiveOption(val) {
        if (this.activeOption === val) return;
        this.previousOption = this.activeOption;
        this.activeOption = val;
        this.inclusionList = [];//assumes a mode where nothing shows until added to the inclusion list
    }
    setMoveSets(val) {
        this.moveSets = val;
    }
    setInclusionList(val) {
        this.inclusionList = val;
    }
    includeInList(id) {
        if (!this.inclusionList) this.inclusionList = [];
        if (this.inclusionList.indexOf(id) < 0) {
            this.inclusionList.push(id);
        }
    }
}

decorate(MainStore, {
    previousOption: observable,
    activeOption: observable,
    moveSets: observable,
    inclusionList: observable,

    setActiveOption: action,
    setMoveSets: action,
    setInclusionList: action,
    includeInList: action,
});
