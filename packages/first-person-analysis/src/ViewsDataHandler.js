import {ADataHandler} from "colorizer-three";

/**
 * Creates a new instance of ViewsDataHandler.
 * @class
 * @returns An instance of ViewsDataHandler.
 * @example
 * var instance = new ViewsDataHandler();
 */
export default class ViewsDataHandler extends ADataHandler {
    constructor(store) {
        super();
        this.store = store;
    }

    updateStudyPos() {
        if (this.store.uiStore.isPlaying) {
            this.store.uiStore.setCurrentStudyPoint(this.store.uiStore.studyPoints.current + 1);
        }
        return this.store.uiStore.studyPoints.current;
    }
}