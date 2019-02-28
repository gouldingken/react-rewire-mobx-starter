import PointGenerator from "./PointGenerator";

const Offset = require('polygon-offset');
const interpolateLineRange = require('line-interpolate-points');

/**
 * Creates a new instance of PolyOffset.
 * @class
 * @returns An instance of PolyOffset.
 * @example
 * var instance = new PolyOffset();
 */
export default class PolyOffset extends PointGenerator {

    constructor(polygon) {
        super();
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

    get type() {
        return 'PolyOffset';
    }

    calculateOffsetPoints(offsetAmount, intervalSpacing) {
        const offset2d = new Offset(null, 3);
        const loopPoints = this.points2d.slice(0);//clone
        if (loopPoints.length < 3) {
            return null;
        }
        loopPoints.push(this.points2d[0]);//uses repetition to define closed or not...

        console.log('loopPoints: '+loopPoints.length);
        const points = offset2d.data(loopPoints).margin(offsetAmount)[0];//.offsetLine(offsetAmount);
        let perimeter = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const point1 = points[i];
            const point2 = points[i + 1];
            perimeter += PolyOffset.distance(point1, point2);
        }
        const numPoints = Math.round(perimeter / intervalSpacing);
        // return points;
        return interpolateLineRange(points, numPoints, 0);
        //if last point and first point are closer than tolerance, remove last point
        // if (pointRing.length > 3) {
        //     //Note that last point and first point are duplicates of each other, so we must look at penultimate point
        //     if (PolyOffset.distance(pointRing[0], pointRing[pointRing.length - 2]) < intervalSpacing * 0.1) {
        //         pointRing.splice(-2, 1);
        //     }
        // }
        // return pointRing;
    }

    static distance(pt1, pt2) {
        const a = pt1[0] - pt2[0];
        const b = pt1[1] - pt2[1];

        return Math.sqrt(a * a + b * b);
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
