import {action, computed, decorate, observable} from "mobx";

/**
 * Creates a new instance of OptionsStore.
 * @class
 * @returns An instance of OptionsStore.
 * @example
 * var instance = new OptionsStore();
 */
export default class OptionsStore {
    static chartColorIndex = 0;
    static chartColors = [
        "#79a5ce",
        "#cb566d",
        "#c3803b",
        "#5f5ea5",
        "#65c09c"
    ];
    options = [{name: 'Option 1', key: 'option-1', selected: true, chartColor: OptionsStore.nextColor()}];

    constructor() {
    };

    addOption() {
        const num = this.options.length + 1;
        const newOption = {name: `Option ${num}`, key: `option-${num}`, chartColor: OptionsStore.nextColor()};
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

    static nextColor() {
        OptionsStore.chartColorIndex++;
        if (OptionsStore.chartColorIndex >= OptionsStore.chartColors.length) {
            OptionsStore.chartColorIndex = 0;
        }
        return OptionsStore.chartColors[OptionsStore.chartColorIndex];
    }
}


decorate(OptionsStore, {
    options: observable,
    selectedOptions: computed,
    addOption: action,
    selectOption: action,
});
