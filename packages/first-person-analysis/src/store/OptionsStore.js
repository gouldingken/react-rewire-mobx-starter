import {action, computed, decorate, observable} from "mobx";

/**
 * Creates a new instance of OptionsStore.
 * @class
 * @returns An instance of OptionsStore.
 * @example
 * var instance = new OptionsStore();
 */
export default class OptionsStore {

    options = [{name: 'Option 1', key: 'option-1', selected: true}];

    constructor() {
    };

    addOption() {
        const num = this.options.length + 1;
        const newOption = {name: `Option ${num}`, key: `option-${num}`};
        this.options.push(newOption);
    }

    getOption(key) {
        return this.options.find((o) => o.key === key);
    }

    get selectedOptions() {
        return this.options.filter((option, i) => option.selected).map((option) => option.key);
    }

    selectOption(key, additive) {
        this.options.forEach((option, i) => {
            if (additive) {
                if (option.key === key) {
                    option.selected = !option.selected;
                }
            } else {
                option.selected = (option.key === key);
            }
        });
    }
}


decorate(OptionsStore, {
    options: observable,
    selectedOptions: computed,
    addOption: action,
    selectOption: action,
});
