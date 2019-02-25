import {autorun} from "mobx";
import PolyOffset from "./geometry/PolyOffset";

/**
 * Creates a new instance of SceneData.
 * @class
 * @returns An instance of SceneData.
 * @example
 * var instance = new SceneData();
 */
export default class SceneData {

    constructor(store) {
        this.store = store;
        this.polyOffsets = [];
        this.zOffset = 6;
        this.viewBlockers = [];
        this.studyPointClouds = [];
        this.studyPointPaths = [];
        this.optionsObjects = [];

        const {targetStore, uiStore, optionsStore} = this.store;
        autorun(() => {
            if (!this.threeApp) return;
            // console.log('AUTORUN '+JSON.stringify(targetStore.viewTargets))
            this.threeApp.reprojector.updateChannels(targetStore.channels);
        });

        autorun(() => {
            if (!this.threeApp) return;
            // console.log('AUTORUN '+JSON.stringify(targetStore.viewTargets))
            this.threeApp.viewDataReader.setObstructionVisibility(uiStore.blockersVisible);
        });

        autorun(() => {
            if (!this.threeApp) return;
            // console.log('AUTORUN '+JSON.stringify(targetStore.viewTargets))
            this.setOptionVisibility(optionsStore.selectedOptions);
        });
    };

    get threeApp() {
        return window.threeAppInstance;
    }

    setViewTargets(objectsToAdd, targetId) {
        const threeObjects = this.threeApp.addObjects(objectsToAdd);
        this.store.targetStore.setTargetObjects(targetId, threeObjects);
    }

    updateObjects(objectsToAdd, type) {
        const activeOptions = this.store.optionsStore.selectedOptions;
        const addedObjects = this.threeApp.addObjects(objectsToAdd);

        addedObjects.forEach((o, i) => {
            o.userData.options = activeOptions;
            this.optionsObjects.push(o);
        });

        if (type === 'paths') {
            this.threeApp.addExtras(addedObjects);
            addedObjects.forEach((pathObject, i) => {
                this.studyPointPaths.push(pathObject);
            });
        }

        this.addPolyOffsets();

        this.store.uiStore.setStudyPointCount(this.threeApp.studyPoints.length);
    }

    addOutline(outline) {
        const polyOffset = new PolyOffset(outline);
        polyOffset.options = this.store.optionsStore.selectedOptions;
        this.polyOffsets.push(polyOffset);
    }

    addPolyOffsets() {
        const {offset, spacing} = this.store.uiStore.pointOptions;

        this.polyOffsets.forEach((polyOffset, i) => {
            if (!polyOffset.pointsAdded) {
                const offsetPoints = polyOffset.calculateOffsetPoints(offset, spacing);
                const pointCloud = this.threeApp.addPoints(offsetPoints.map((pt) => {
                    return [pt[0], pt[1], polyOffset.zPos + this.zOffset];
                }));
                pointCloud.userData.options = polyOffset.options;
                this.optionsObjects.push(pointCloud);
                this.studyPointClouds.push(pointCloud);
                polyOffset.pointsAdded = true;
            }
        });
    }

    updatePoints() {
        this.clearPoints();
        this.polyOffsets.forEach((polyOffset, i) => {
            polyOffset.pointsAdded = false;
        });
        this.addPolyOffsets();
        this.store.uiStore.setStudyPointCount(this.threeApp.studyPoints.length);
        this.store.readingsStore.reset();
    }

    clearStudyPoints() {
        this.clearPoints();

        this.polyOffsets.length = 0;

        this.threeApp.removeObjects(this.studyPointPaths);
        this.studyPointPaths.length = 0;
        this.store.uiStore.setStudyPointCount(this.threeApp.studyPoints.length);
    }

    clearPoints() {
        this.threeApp.removeObjects(this.studyPointClouds);
        this.threeApp.studyPoints.length = 0;
        this.studyPointClouds.length = 0;
    }

    clearViewBlockers() {
        this.threeApp.removeObjects(this.viewBlockers);
        this.viewBlockers.length = 0;
    }

    setViewBlockers(objectsToAdd) {
        const activeOptions = this.store.optionsStore.selectedOptions;
        const objectsAdded = this.threeApp.addObjects(objectsToAdd);
        objectsAdded.forEach((mesh, i) => {
            mesh.userData.options = activeOptions;
            this.optionsObjects.push(mesh);
            this.viewBlockers.push(mesh);
            this.threeApp.viewDataReader.addObstructionMesh(mesh);
        });

    }

    setOptionVisibility(selectedOptions) {
        this.optionsObjects.forEach((o, i) => {
            if (o.userData.options) {
                let include = false;
                selectedOptions.forEach((option, i) => {
                    if (o.userData.options.indexOf(option) >= 0) {
                        include = true;
                    }
                });
                o.userData.excluded = !include;
            }
        });
    }
}
