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
        let num = this.options.length + 1;
        const usedKeys = this.options.map((o) => o.key);
        while(usedKeys.indexOf(`option-${num}`) >= 0) {
            num++;
        }
        const newOption = {name: `Option ${num}`, key: `option-${num}`, chartColor: OptionsStore.nextColor()};
        this.options.push(newOption);
        return newOption;
    }

    getOption(key) {
        return this.options.find((o) => o.key === key);
    }

    updateOption(key, obj) {
        const option = this.getOption(key);
        if (!option) return;
        Object.keys(obj).forEach((k) => {
            option[k] = obj[k];
        });
    }

    get selectedOptions() {
        return this.options.filter((option, i) => option.selected).map((option) => option.key);
    }


    ensureASelection() {
        const sel = this.selectedOptions;
        if (sel.length === 0) {
            this.options[0].selected = true;
        }
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
            if (option.selected && option.onSelect) {
                option.onSelect();
            }
        });
    }

    setOptions(options) {
        this.options = options;
    }

    static nextColor() {
        OptionsStore.chartColorIndex++;
        if (OptionsStore.chartColorIndex >= OptionsStore.chartColors.length) {
            OptionsStore.chartColorIndex = 0;
        }
        return OptionsStore.chartColors[OptionsStore.chartColorIndex];
    }

    deleteOption(key) {
        let index = -1;
        this.options.forEach((option, i) => {
            if (option.key === key) {
                index = i;
            }
        });
        if (index >= 0) {
            this.options.splice(index, 1);
        }
        this.ensureASelection();
    }


    getMeta() {
        return {options: this.options};
    }

    setMeta(meta) {
        this.options = meta.options;
    }

}


decorate(OptionsStore, {
    options: observable,
    selectedOptions: computed,
    addOption: action,
    selectOption: action,
    deleteOption: action,
    setOptions: action,
    updateOption: action,
    setMeta: action,
});
