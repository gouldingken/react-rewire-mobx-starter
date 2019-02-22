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
    };

    setViewTargets(objectsToAdd, targetId) {
        const threeObjects = window.threeAppInstance.addObjects(objectsToAdd);
        this.store.targetStore.setTargetObjects(targetId, threeObjects);
    }

    updateObjects(objectsToAdd, type) {
        const addedObjects = window.threeAppInstance.addObjects(objectsToAdd);

        if (type === 'paths') {
            window.threeAppInstance.addExtras(addedObjects);
        }

        this.polyOffsets.forEach((polyOffset, i) => {
            if (!polyOffset.pointsAdded) {
                const offsetPoints = polyOffset.calculateOffsetPoints(this.offsetAmount, this.intervalSpacing);
                window.threeAppInstance.addPoints(offsetPoints.map((pt) => {
                    return [pt[0], pt[1], polyOffset.zPos + this.zOffset];
                }));
                polyOffset.pointsAdded = true;
            }
        });

        this.store.uiStore.setStudyPointCount(window.threeAppInstance.studyPoints.length);
    }

    setViewBlockers(objectsToAdd) {
        const objectsAdded = window.threeAppInstance.addObjects(objectsToAdd);
        objectsAdded.forEach((mesh, i) => {
            window.threeAppInstance.viewDataReader.addObstructionMesh(mesh);
        });

    }


}