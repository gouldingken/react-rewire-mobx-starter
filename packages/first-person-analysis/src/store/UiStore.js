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
    lastPickedPoint = null;
    viewAngleDeg = 270;

    isPlaying = false;
    blockersVisible = true;
    reviewDarkBlockers = false;
    pointCloudOptions = {pointSize: 5, colorByDifference:false};

    // targetChartMultiplier =  1 / ReadingsStore.sunAreaOfFullSphere;
    targetChartMax = 5000;
    pointOptions = {spacing: 25, offset: 1, height: 5};
    surfaceOptions = {density: 50, height: 5};
    analysisOptions = {viewsOnly: false};
    viewOptions = {showPreview:true, matchAspect:false};

    selectionPoints = {
        'indices': [],
        '2d': [],
        '3d': [],
    };

    constructor() {
    };

    togglePanelCollapsed(panelId) {

        this.getPanelState(panelId).collapsed = !this.getPanelState(panelId).collapsed;
    }

    getPanelState(panelId, initCollapsed = false) {
        if (!this.panelStates[panelId]) {
            this.panelStates[panelId] = {collapsed: initCollapsed};
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

    setLastPickedPoint(val) {
        this.lastPickedPoint = val;
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

    setReviewDarkBlockers(val) {
        this.reviewDarkBlockers = val;
    }

    setTargetChartMax(val) {
        this.targetChartMax = val;
    }

    setPointOptions(updates) {
        Object.keys(updates).forEach((k) => {
            this.pointOptions[k] = updates[k];
        });
    }

    setPointCloudOptions(updates) {
        Object.keys(updates).forEach((k) => {
            this.pointCloudOptions[k] = updates[k];
        });
    }

    setSurfaceOptions(updates) {
        Object.keys(updates).forEach((k) => {
            this.surfaceOptions[k] = updates[k];
        });
    }

    setAnalysisOptions(updates) {
        Object.keys(updates).forEach((k) => {
            this.analysisOptions[k] = updates[k];
        });
    }

    setViewOptions(updates) {
        Object.keys(updates).forEach((k) => {
            this.viewOptions[k] = updates[k];
        });
    }

    setMode(val) {
        this.mode = val;
    }

    setViewAngleDeg(val) {
        this.viewAngleDeg = val;
    }

    setSelectedReviewTarget(val) {
        this.selectedReviewTarget = val;
    }

    setValueRampMultiplier(val) {
        this.valueRampMultiplier = val;
    }

    setSelectionPoints(dimension, val) {
        this.selectionPoints[dimension] = val;
    }

    getMeta() {
        return {
            mode: this.mode,
            selectedReviewTarget: this.selectedReviewTarget,
            valueRampMultiplier: this.valueRampMultiplier,
            pointOptions: this.pointOptions,
            pointCloudOptions: this.pointCloudOptions,
            surfaceOptions: this.surfaceOptions,
            analysisOptions: this.analysisOptions,
            blockersVisible: this.blockersVisible,
            reviewDarkBlockers: this.reviewDarkBlockers,
        };
    }

    setMeta(meta) {
        this.insertDefaultsIfMissing(meta);
        this.mode = meta.mode;
        this.selectedReviewTarget = meta.selectedReviewTarget;
        this.valueRampMultiplier = meta.valueRampMultiplier;
        this.pointOptions = meta.pointOptions;
        this.pointCloudOptions = meta.pointCloudOptions;
        this.surfaceOptions = meta.surfaceOptions;
        this.analysisOptions = meta.analysisOptions;
        this.blockersVisible = meta.blockersVisible;
        this.reviewDarkBlockers = meta.reviewDarkBlockers;
    }

    insertDefaultsIfMissing(meta) {
        const defaultMeta = this.getMeta();
        Object.keys(defaultMeta).forEach((k) => {
            if (!meta[k]) meta[k] = defaultMeta[k];
        });
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
    pointCloudOptions: observable,
    surfaceOptions: observable,
    analysisOptions: observable,
    viewOptions: observable,
    selectionPoints: observable,
    reviewDarkBlockers: observable,
    viewAngleDeg: observable,
    setCurrentStudyPoint: action,
    selectNearestStudyPoint: action,
    setStudyPointCount: action,
    togglePanelCollapsed: action,
    setIsPlaying: action,
    setBlockersVisible: action,
    setTargetChartMax: action,
    setPointOptions: action,
    setPointCloudOptions: action,
    setSurfaceOptions: action,
    setAnalysisOptions: action,
    setMode: action,
    setSelectedReviewTarget: action,
    setValueRampMultiplier: action,
    setLastPickedPoint: action,
    setSelectionPoints: action,
    setReviewDarkBlockers: action,
    setViewAngleDeg: action,
    setViewOptions: action,
});
