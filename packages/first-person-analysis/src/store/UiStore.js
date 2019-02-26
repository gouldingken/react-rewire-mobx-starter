import {action, autorun, decorate, observable} from "mobx";
import ReadingsStore from "./ReadingsStore";

/**
 * Creates a new instance of UiStore.
 * @class
 * @returns An instance of UiStore.
 * @example
 * var instance = new UiStore();
 */
export default class UiStore {

    mode = 'analyze';
    selectedReviewTarget = 'target1';
    valueRampMultiplier = 1;

    panelStates = {};
    studyPoints = {current: 0, count: 0};
    isPlaying = false;
    blockersVisible = true;

    targetChartMultiplier =  1 / ReadingsStore.sunAreaOfFullSphere;
    targetChartMax = 5000;
    pointOptions = {spacing: 10, offset: 1};

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
            this.isPlaying = false;//TODO is there a case where we don't want this behavior (should it loop if playing?)
        }
        this.studyPoints.current = pos;
    }

    setStudyPointCount(count) {
        this.studyPoints.count = count;
        if (this.studyPoints.current >= count) {
            this.studyPoints.current = count - 1;
        }
    }

    setIsPlaying(isPlaying) {
        this.isPlaying = isPlaying;
    }

    setBlockersVisible(val) {
        this.blockersVisible = val;
    }

    setTargetChartMax(val) {
        this.targetChartMax = val;
    }

    setPointOptions(updates) {
        Object.keys(updates).forEach((k) => {
            this.pointOptions[k] = updates[k];
        });
    }

    setMode(val) {
        this.mode = val;
    }

    setSelectedReviewTarget(val) {
        this.selectedReviewTarget = val;
    }

    setValueRampMultiplier(val) {
        this.valueRampMultiplier = val;
    }
}


decorate(UiStore, {
    mode: observable,
    selectedReviewTarget: observable,
    valueRampMultiplier: observable,
    isPlaying: observable,
    studyPoints: observable,
    panelStates: observable,
    blockersVisible: observable,
    targetChartMax: observable,
    pointOptions: observable,
    setCurrentStudyPoint: action,
    setStudyPointCount: action,
    togglePanelCollapsed: action,
    setIsPlaying: action,
    setBlockersVisible: action,
    setTargetChartMax: action,
    setPointOptions: action,
    setMode: action,
    setSelectedReviewTarget: action,
    setValueRampMultiplier: action,
});
