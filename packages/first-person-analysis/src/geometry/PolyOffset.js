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
        console.log(JSON.stringify(polygon));
    };

    calculateOffsetPoints(offsetAmount, intervalSpacing) {
        const offset2d = new Offset();
        // const points =  offset2d.data(this.points2d).margin(offsetAmount)[0];//.offsetLine(offsetAmount);
        return interpolateLineRange(this.points2d, 100, offsetAmount, intervalSpacing);
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
