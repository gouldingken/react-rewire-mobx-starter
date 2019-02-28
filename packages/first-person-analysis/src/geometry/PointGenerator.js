/**
 * Creates a new instance of PointGenerator.
 * @class
 * @returns An instance of PointGenerator.
 * @example
 * var instance = new PointGenerator();
 */
export default class PointGenerator {
    pointsAdded = false;
    options = [];
    constructor() {
    };

    get type() {
        throw 'type must be set on implementation';
    }
}
