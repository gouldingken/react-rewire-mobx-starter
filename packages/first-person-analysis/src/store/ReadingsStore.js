import {action, computed, decorate, observable} from "mobx";

/**
 * Creates a new instance of ReadingsStore.
 * @class
 * @returns An instance of ReadingsStore.
 * @example
 * var instance = new ReadingsStore();
 */
export default class ReadingsStore {

    readings = {};
    readingsCount = 0;

    constructor() {
    };

    getReading(index) {
        if (!this.readings[index]) {
            this.readings[index] = {
                index: index,
                values:{}
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
    readings: observable,
    readingsCount: observable,
    setReading: action,
});
