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
    activeOption = 'Existing';
    previousOption = 'Existing';
    moveSetsByOption = {};
    moveSets = [];
    inclusionList = [];
    highlightProgram = null;

    constructor() {
        this.timelineInteractionStore = new InteractionStore();
    };

    setMoveSetsByOption(val) {
        this.moveSetsByOption = val;
        this.setMoveSets(this.moveSetsByOption[this.activeOption]);
    }

    setActiveOption(val) {
        if (this.activeOption === val) return;
        this.previousOption = this.activeOption;
        this.activeOption = val;
        this.inclusionList = [];//assumes a mode where nothing shows until added to the inclusion list
        this.setMoveSets(this.moveSetsByOption[this.activeOption]);
    }

    setMoveSets(val) {
        this.moveSets = val;
    }

    setInclusionList(val) {
        this.inclusionList = val;
    }

    setHighlightProgram(val) {
        console.log('setHighlightProgram: ' + val);

        this.highlightProgram = val;
    }

    includeInList(id) {
        if (!this.inclusionList) this.inclusionList = [];
        if (this.inclusionList.indexOf(id) < 0) {
            this.inclusionList.push(id);
        }
    }
    excludeFromList(id) {
        if (!this.inclusionList) return;
        let index = this.inclusionList.indexOf(id);
        if (index >= 0) {
            this.inclusionList.splice(index, 1);
        }
    }
}

decorate(MainStore, {
    previousOption: observable,
    activeOption: observable,
    moveSets: observable,
    moveSetsByOption: observable,
    inclusionList: observable,
    highlightProgram: observable,

    setActiveOption: action,
    setMoveSets: action,
    setInclusionList: action,
    setHighlightProgram: action,
    setMoveSetsByOption: action,
    includeInList: action,
});
