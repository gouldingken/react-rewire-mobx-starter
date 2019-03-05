/**
 * Creates a new instance of PlanarSelection.
 * Provides a way to select interim points on a 3D planar grid given a selection of 2 points
 * @class
 * @returns An instance of PlanarSelection.
 * @example
 * var instance = new PlanarSelection();
 */
import {Plane, Vector3} from "three-full";

export default class PlanarSelection {

    matchingPoints;
    constructor(corner1, corner2) {
        this.corner1 = corner1;
        this.corner2 = corner2;

        let otherCorner;
        if (Math.abs(corner1.y - corner2.y) < 0.1) {//support horizontal or vertical planes
            otherCorner = new Vector3(corner1.x, corner1.y, corner2.z);
        } else {
            otherCorner = new Vector3(corner1.x, corner2.y, corner1.z);
        }
        this.plane = new Plane();
        this.plane.setFromCoplanarPoints(corner1, corner2, otherCorner);

        this.corner3 = otherCorner;
    };

    findPlanarPointsBetween(points, planeTolerance = 0.001, boundsTolerance = 0.1) {
        const {corner1, corner2} = this;
        //matching points are on the plane and within the 3D bounding box defined by the 2 corner points
        const min = new Vector3(
            Math.min(corner1.x, corner2.x),
            Math.min(corner1.y, corner2.y),
            Math.min(corner1.z, corner2.z),
        );
        const max = new Vector3(
            Math.max(corner1.x, corner2.x),
            Math.max(corner1.y, corner2.y),
            Math.max(corner1.z, corner2.z),
        );

        this.matchingPoints = points.filter((pt)=> {
            if (pt.x < min.x - boundsTolerance || pt.x > max.x + boundsTolerance) return false;
            if (pt.y < min.y - boundsTolerance || pt.y > max.y + boundsTolerance) return false;
            if (pt.z < min.z - boundsTolerance || pt.z > max.z + boundsTolerance) return false;
            return Math.abs(this.plane.distanceToPoint(pt)) <= planeTolerance;
        });




    }
}
