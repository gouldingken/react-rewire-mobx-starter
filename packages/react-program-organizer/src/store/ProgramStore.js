import {action, autorun, decorate, observable} from "mobx";
import MainStore from "program-arrangements/src/MainStore";

/**
 * Creates a new instance of ProgramStore.
 * @class
 * @returns An instance of ProgramStore.
 * @example
 * var instance = new ProgramStore();
 */
export default class ProgramStore {

    programCategories = [];

    constructor() {
        const reactToStuff = autorun(() => {

            console.log("New Value: ", this.programCategories);
            this.programCategories.forEach((category, i) => {
                category.blocks.forEach((block, i) => {
                    console.log(block.sliderValue)
                });
            });
        });
    };

    setProgramCategories(val) {
        this.programCategories = [];
        val.forEach((category, i) => {
            const categoryStore = new CategoryStore(category.title, 'c_' + i);
            this.programCategories.push(categoryStore);
            category.blocks.forEach((block, i) => {
                const blockStore = new BlockStore(block.title, 'b_' + i);
                categoryStore.addBlock(blockStore);
                blockStore.updateSlider(block.sliderValue);
                block.details.forEach((detail, i) => {
                    blockStore.addDetail(new DetailStore(detail.title, 'd_' + i));
                });
            });
        });
    }
}

decorate(MainStore, {
    programCategories: observable,

    setProgramCategories: action,
});

class CategoryStore {
    blocks = [];

    constructor(title, key) {
        this.title = title;
        this.key = key;
    }

    addBlock(block) {
        this.blocks.push(block);
    }
}

decorate(CategoryStore, {
    title: observable,
    blocks: observable,

    addBlock: action,
});


class BlockStore {
    details = [];
    sliderValue = 0;

    constructor(title, key) {
        this.title = title;
        this.key = key;
    }

    updateSlider(value) {
        this.sliderValue = value;
        let numShares = 0;
        this.details.forEach((detail, i) => {
            numShares += detail.priority;
        });
        this.details.forEach((detail, i) => {
            detail.setArea(this.sliderValue * detail.priority / numShares);
            detail.setCount(2);
        });
    }

    addDetail(detail) {
        this.details.push(detail);
        detail.setArea(this.sliderValue / this.details.length);
        detail.setCount(2);
        detail.priority = this.details.length;
    }
}

decorate(BlockStore, {
    title: observable,
    details: observable,
    sliderValue: observable,

    setBlocks: action,
    updateSlider: action,
    addDetail: action,
});

class DetailStore {
    count = 0;
    area = 0;
    priority = 1;

    constructor(title, key) {
        this.title = title;
        this.key = key;
    }

    setArea(val) {
        this.area = val;
    }

    setCount(val) {
        this.count = val;
    }
}

decorate(DetailStore, {
    title: observable,
    count: observable,
    area: observable,

    setArea: action,
    setCount: action,
});

