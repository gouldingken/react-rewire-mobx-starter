import {action, autorun, decorate, observable} from "mobx";

/**
 * Creates a new instance of UiStore.
 * @class
 * @returns An instance of UiStore.
 * @example
 * var instance = new UiStore();
 */
export default class UiStore {

    panelStates = {};
    studyPoints = {current: 0, count: 0};
    isPlaying = false;

    constructor() {
    };

    togglePanelCollapsed(panelId) {

        this.getPanelState(panelId).collapsed = !this.getPanelState(panelId).collapsed;
    }

    getPanelState(panelId) {
        if (!this.panelStates[panelId]) {
            this.panelStates[panelId] = {collapsed: false};
        }
        return this.panelStates[panelId];
    }

    setCurrentStudyPoint(pos) {
        if (pos < 0) {
            pos = 0;
        }
        if (pos >= this.studyPoints.count) {
            pos = this.studyPoints.count - 1;
        }
        this.studyPoints.current = pos;
    }
    setStudyPointCount(count) {
        this.studyPoints.count = count;
    }

    setIsPlaying(isPlaying) {
        this.isPlaying = isPlaying;
    }
}


decorate(UiStore, {
    isPlaying: observable,
    studyPoints: observable,
    panelStates: observable,
    setCurrentStudyPoint: action,
    setStudyPointCount: action,
    togglePanelCollapsed: action,
    setIsPlaying: action,
});
