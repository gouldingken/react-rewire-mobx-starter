import {action, computed, decorate, observable} from "mobx";

/**
 * Creates a new instance of ReadingsStore.
 * @class
 * @returns An instance of ReadingsStore.
 * @example
 * var instance = new ReadingsStore();
 */
export default class ReadingsStore {

    readingSets = {};

    constructor(optionsStore) {
        this.optionsStore = optionsStore;
    };

    get activeReadingSet() {
        if (this.optionsStore.selectedOptions.length !== 1) return null;
        const selectedOption = this.optionsStore.selectedOptions[0];
        if (!this.readingSets[selectedOption]) this.readingSets[selectedOption] = new ReadingsSet(selectedOption);
        return this.readingSets[selectedOption];
    }

    reset() {
        if (!this.activeReadingSet) return;
        this.activeReadingSet.reset();
    }

    setReading(index, data) {
        if (!this.activeReadingSet) return;
        this.activeReadingSet.setReading(index, data);
    }

    get readingsCount() {
        if (!this.activeReadingSet) return 0;
        return this.activeReadingSet.readingsCount;
    }
}

class ReadingsSet {

    readings = {};
    readingsCount = 0;

    constructor(id) {
        this.id = id;
    };

    reset() {
        this.readings = {};
        this.readingsCount = 0;
    }

    getReading(index) {
        if (!this.readings[index]) {
            this.readings[index] = {
                index: index,
                values: {}
            };
        }
        return this.readings[index];
    }

    setReading(index, data) {
        this.getReading(index).values = data;
        this.readingsCount = Object.keys(this.readings).length;
    }
}


decorate(ReadingsStore, {
    readingSets: observable,
    readingsCount: computed,
    setReading: action,
    reset: action,
});
decorate(ReadingsSet, {
    readings: observable,
    readingsCount: observable,
    setReading: action,
    reset: action,
});
