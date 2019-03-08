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

    setCurrentStudyPoint(index, setLastPicked) {
        const {uiStore} = this.store;
        let studyPoint = this.getStudyPoint(index);
        if (setLastPicked) {
            uiStore.setLastPickedPoint(studyPoint);//treat like a user click so it persists
        }
        uiStore.setCurrentStudyPoint(index);
        uiStore.setSelectionPoints('3d', [studyPoint]);
        uiStore.setSelectionPoints('indices', [index]);
    }

    setStudyPosData(sensor) {
        if (this.store.uiStore.mode !== 'analyze') return;//prevent modifying points when in 'review mode' - though this removes the fun chart watching...
        const index = this.store.uiStore.studyPoints.current;
        this.store.readingsStore.setReading(index, sensor);
        this.store.targetStore.setCurrentValues(sensor);
    }

    getStudyPoint(index) {
        if (this.activeStudyPoints.length > index && this.activeStudyPoints[index]) {
            return this.activeStudyPoints[index];
        }
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

    saveScene() {
        this.emit('SaveScene');
    }

    loadScene(data) {
        this.emit('LoadScene', data);
    }
}