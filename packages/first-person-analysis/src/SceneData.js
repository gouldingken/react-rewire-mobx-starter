import {autorun} from "mobx";

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
        this.offsetAmount = 1;
        this.intervalSpacing = 2;
        this.zOffset = 6;
        this.viewBlockers = [];
        this.studyPointClouds = [];
        this.studyPointPaths = [];

        const {targetStore, uiStore} = this.store;
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
    };

    get threeApp() {
        return window.threeAppInstance;
    }

    setViewTargets(objectsToAdd, targetId) {
        const threeObjects = this.threeApp.addObjects(objectsToAdd);
        this.store.targetStore.setTargetObjects(targetId, threeObjects);
    }

    updateObjects(objectsToAdd, type) {
        const addedObjects = this.threeApp.addObjects(objectsToAdd);

        if (type === 'paths') {
            this.threeApp.addExtras(addedObjects);
            addedObjects.forEach((pathObject, i) => {
                this.studyPointPaths.push(pathObject);
            });
        }

        this.polyOffsets.forEach((polyOffset, i) => {
            if (!polyOffset.pointsAdded) {
                const offsetPoints = polyOffset.calculateOffsetPoints(this.offsetAmount, this.intervalSpacing);
                const pointCloud = this.threeApp.addPoints(offsetPoints.map((pt) => {
                    return [pt[0], pt[1], polyOffset.zPos + this.zOffset];
                }));
                this.studyPointClouds.push(pointCloud);
                polyOffset.pointsAdded = true;
            }
        });

        this.store.uiStore.setStudyPointCount(this.threeApp.studyPoints.length);
    }

    clearStudyPoints() {
        this.threeApp.removeObjects(this.studyPointClouds);
        this.threeApp.studyPoints.length = 0;
        this.studyPointClouds.length = 0;

        this.threeApp.removeObjects(this.studyPointPaths);
        this.studyPointPaths.length = 0;
        this.store.uiStore.setStudyPointCount(this.threeApp.studyPoints.length);
    }

    clearViewBlockers() {
        this.threeApp.removeObjects(this.viewBlockers);
        this.viewBlockers.length = 0;
    }

    setViewBlockers(objectsToAdd) {
        const objectsAdded = this.threeApp.addObjects(objectsToAdd);
        objectsAdded.forEach((mesh, i) => {
            this.viewBlockers.push(mesh);
            this.threeApp.viewDataReader.addObstructionMesh(mesh);
        });

    }


}
