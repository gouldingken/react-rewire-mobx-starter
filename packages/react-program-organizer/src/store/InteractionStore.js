import {action, autorun, decorate, observable} from "mobx";

/**
 * Creates a new instance of InteractionStore.
 * @class
 * @returns An instance of InteractionStore.
 * @example
 * var instance = new InteractionStore();
 */
export default class InteractionStore {
    editingDetail = null;

    setEditingDetail(val) {
        this.editingDetail = val;
    }
}

decorate(InteractionStore, {
    editingDetail: observable,

    setEditingDetail: action,
});