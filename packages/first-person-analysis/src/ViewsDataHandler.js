import {ADataHandler} from "colorizer-three";
import {Vector3} from "three-full";

/**
 * Creates a new instance of ViewsDataHandler.
 * @class
 * @returns An instance of ViewsDataHandler.
 * @example
 * var instance = new ViewsDataHandler();
 */
export default class ViewsDataHandler extends ADataHandler {
    static ANIMATED_POINTS_COUNT = 20000;//TODO dynamic points length??

    constructor(store) {
        super();
        this.store = store;
        this.activeStudyPoints = [];
    }

    updateStudyPos() {
        if (this.store.uiStore.isPlaying) {
            this.store.uiStore.setCurrentStudyPoint(this.store.uiStore.studyPoints.current + 1);
        }
        return this.store.uiStore.studyPoints.current;
    }
    setStudyPosData(sensor) {
        const index = this.store.uiStore.studyPoints.current;
        this.store.readingsStore.setReading(index, sensor);
        this.store.targetStore.setCurrentValues(sensor);
    }

    nextStudyPos() {
        if (this.activeStudyPoints.length > 0) {
            const index = this.updateStudyPos();
            if (this.activeStudyPoints[index]) {
                return this.activeStudyPoints[index];
            }
        }
        return new Vector3();
    }

    findNearestPoint(position) {
        const nearest = {distance: Number.MAX_VALUE, index: -1};

        this.activeStudyPoints.forEach((point, i) => {
            const dist = point.distanceTo(position);
            if (dist < nearest.distance) {
                nearest.distance = dist;
                nearest.index = i;
            }
        });
        return nearest.index;
    }

    setActiveStudyPoints(activeStudyPoints) {
        const {uiStore} = this.store;
        this.activeStudyPoints = activeStudyPoints;
        uiStore.setStudyPointCount(activeStudyPoints.length);
        // readingsStore.reset();
        uiStore.setCurrentStudyPoint(0);
        uiStore.setIsPlaying(false)
    }

    initialize(threeApp) {
        this.emit('ThreeAppReady', threeApp);
    }
}