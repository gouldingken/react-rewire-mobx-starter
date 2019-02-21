const Offset = require('polygon-offset');
var interpolateLineRange = require( 'line-interpolate-points' )

/**
 * Creates a new instance of PolyOffset.
 * @class
 * @returns An instance of PolyOffset.
 * @example
 * var instance = new PolyOffset();
 */
export default class PolyOffset {

    pointsAdded = false;

    constructor(polygon) {
        this.points = [];
        this.points2d = [];
        const used = {};
        polygon.curves.forEach((curve, i) => {
            curve.vertices.forEach((vertex, i) => {
                const v = vertex.join('_');
                if (!used[v]) {
                    this.points.push(vertex);
                    used[v] = true;
                }
            });
        });
        this.points2d = this.points.map((pt) => [pt[0], pt[1]]);
        this.zPos = this.points[0][2];
        // console.log(JSON.stringify(polygon));
    };

    calculateOffsetPoints(offsetAmount, intervalSpacing) {
        const offset2d = new Offset(null, 3);
        const loopPoints = this.points2d.slice(0);
        loopPoints.push(this.points2d[0]);//uses repetition to define closed or not...
        const points =  offset2d.data(loopPoints).margin(offsetAmount)[0];//.offsetLine(offsetAmount);
        // return points;
        return interpolateLineRange(points, 100, 0, intervalSpacing);
    }

    static test() {
        const polyData = {
            "type": "curves",
            "curves": [{
                "type": "line",
                "vertices": [[58.89097395486307, -54.11762858604184, 72.01], [58.89097395486307, -54.11762858604184, 72.01]]
            }, {
                "type": "line",
                "vertices": [[58.89097395486307, -54.11762858604184, 72.01], [109.50347395486307, -54.11762858604184, 72.01]]
            }, {
                "type": "line",
                "vertices": [[109.50347395486307, -54.11762858604184, 72.01], [109.50347395486307, 50.41362141395817, 72.01]]
            }, {
                "type": "line",
                "vertices": [[109.50347395486307, 50.41362141395817, 72.01], [58.89097395486307, 50.41362141395817, 72.01]]
            }, {
                "type": "line",
                "vertices": [[58.89097395486307, 50.41362141395817, 72.01], [58.89097395486307, -54.11762858604184, 72.01]]
            }]
        };
        const polyOffset = new PolyOffset(polyData);
        const points = polyOffset.calculateOffsetPoints(5, 10);
        return points;
    }
}
