/**
 * Creates a new instance of SceneData.
 * @class
 * @returns An instance of SceneData.
 * @example
 * var instance = new SceneData();
 */
export default class SceneData {

    constructor() {
        this.polyOffsets = [];
        this.offsetAmount = 2;
        this.intervalSpacing = 2;

    };

    updateObjects(objectsToAdd) {
        window.threeAppInstance.addObjects(objectsToAdd);

        this.polyOffsets.forEach((polyOffset, i) => {
            const offsetPoints = polyOffset.calculateOffsetPoints(this.offsetAmount, this.intervalSpacing);
            window.threeAppInstance.addPoints(offsetPoints.map((pt)=> {
                return [pt[0], polyOffset.zPos, pt[1]];
            }));
        });
        window.threeAppInstance.addObjects(objectsToAdd);

    }


}
