import {action, computed, decorate, observable} from "mobx";

/**
 * Creates a new instance of ReadingsStore.
 * @class
 * @returns An instance of ReadingsStore.
 * @example
 * var instance = new ReadingsStore();
 */
export default class ReadingsStore {

    //185,185 sols in full sphere
    static sunAreaOfFullSphere = 5.4e-6;//http://www.mersenneforum.org/showthread.php?t=11612

    readingSets = {};

    constructor(optionsStore, targetStore) {
        this.optionsStore = optionsStore;
        this.targetStore = targetStore;
    };

    get activeReadingSet() {
        if (this.optionsStore.selectedOptions.length !== 1) return null;
        const selectedOption = this.optionsStore.selectedOptions[0];
        if (!this.readingSets[selectedOption]) this.readingSets[selectedOption] = new ReadingsSet(selectedOption, this.targetStore);
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

    summarizeReadings() {
        const summary = [];
        Object.keys(this.readingSets).forEach((key) => {
            summary.push({option: key, values: this.readingSets[key].summarize()});
        });
        return summary;
    }

    get readingsCount() {
        if (!this.activeReadingSet) return 0;
        return this.activeReadingSet.readingsCount;
    }
}

class ReadingsSet {

    readings = {};
    readingsCount = 0;

    constructor(id, targetStore) {
        this.id = id;
        this.targetStore = targetStore;
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

    compare(obj1, obj2) {
        if (obj1 == null || obj2 == null) return false;
        if (typeof obj1 !== typeof obj2) return false;
        if (typeof obj1 === 'object') {
            let match = true;
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) return false;
            keys1.forEach((k) => {
                if (keys2.indexOf(k) < 0) {
                    match = false;
                } else {
                    if (!this.compare(obj1[k], obj2[k])) {
                        match = false;
                    }
                }
            });
            return match;
        } else {
            return obj1 === obj2;
        }
    }

    setReading(index, data) {
        let reading = this.getReading(index);
        //TODO this updates every frame and creates overhead... we should trigger updates only if a value changes
        if (!this.compare(reading.values, data.values)) {
            reading.values = data.values;
        }
        if (!this.compare(reading.position, data.position)) {
            reading.position = data.position;
        }
        this.readingsCount = Object.keys(this.readings).length;
    }

    summarize() {
        const summary = {sums: {available: {}, unobstructed: {}}, sorted: {available: {}, unobstructed: {}}, count: 0};
        Object.keys(this.readings).forEach((k) => {
            let reading = this.readings[k];
            summary.count++;
            Object.keys(reading.values).forEach((c) => {
                const channelId = this.targetStore.getIdForChannel(c);
                const val = this.readings[k].values[c];
                if (!summary.sums.available[channelId]) summary.sums.available[channelId] = 0;
                summary.sums.available[channelId] += val.f / ReadingsStore.sunAreaOfFullSphere;
                if (!summary.sums.unobstructed[channelId]) summary.sums.unobstructed[channelId] = 0;
                summary.sums.unobstructed[channelId] += val.o / ReadingsStore.sunAreaOfFullSphere;

                if (!summary.sorted.available[channelId]) summary.sorted.available[channelId] = [];
                summary.sorted.available[channelId].push(val.f / ReadingsStore.sunAreaOfFullSphere);
                if (!summary.sorted.unobstructed[channelId]) summary.sorted.unobstructed[channelId] = [];
                summary.sorted.unobstructed[channelId].push(val.o / ReadingsStore.sunAreaOfFullSphere);
            });
        });

        Object.keys(summary.sorted).forEach((k) => {
            Object.keys(summary.sorted[k]).forEach((channelId) => {
                const arr = summary.sorted[k][channelId];
                arr.sort((a, b) => b - a);
            });
        });

        return summary;
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
