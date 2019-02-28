/**
 * Creates a new instance of MeshPoints.
 * @class
 * @returns An instance of MeshPoints.
 * @example
 * var instance = new MeshPoints();
 */
import PointGenerator from "./PointGenerator";
import {Triangle, Vector3} from "three-full";
import BridsonSampler3D from "./BridsonSampler3D";

export default class MeshPoints extends PointGenerator {
    triangles;

    constructor(mesh) {
        super();
        this.sampleMode = true;
        this.triangles = MeshPoints.getTriangles(mesh);
        this.bridsonSampler = new BridsonSampler3D();
    };

    static getTriangles(mesh) {
        const triangles = [];
        const vertices = [];
        for (let i = 2; i < mesh.vertices.length; i += 3)
            vertices.push(new Vector3(mesh.vertices[i - 2], mesh.vertices[i - 1], mesh.vertices[i]))

        let k = 0;
        while (k < mesh.faces.length) {
            // TRIANGLE FACE
            if (mesh.faces[k] === 0) {
                const a = vertices[mesh.faces[k + 1]];
                const b = vertices[mesh.faces[k + 2]];
                const c = vertices[mesh.faces[k + 3]];
                triangles.push(new Triangle(a, b, c));
                k += 4
            }
        }
        return triangles;
    }

    get type() {
        return 'MeshPoints';
    }

    calculateRandomOnSurface(density, offset) {
        const area = this.calculateArea();
        const numPoints = area / density;
        let points = [];
        let index = 0;
        let z = 0;
        const next = () => {
            const triangle = this.triangles[index];
            index++;
            if (index >= this.triangles.length) index = 0;
            return MeshPoints.randomPointInTriangle(triangle.a, triangle.b, triangle.c).add(offset);
        };

        if (this.sampleMode) {
            const areaPerPoint = area / numPoints;
            const sampler = this.bridsonSampler.poissonDiscSampler(500, 500, Math.sqrt(areaPerPoint), () => {
                const pt = next();
                z = pt.z;
                return pt;
            });
            let sample;
            while ((sample = sampler()) && points.length < numPoints) {
                console.log('x, y:', sample[0], sample[1]);
                let contained = false;
                const pt = new Vector3(sample[0], sample[1], z);
                this.triangles.forEach((triangle, i) => {
                    if (triangle.containsPoint(pt)) {
                        contained = true;
                    }
                });
                if (contained) {
                    points.push(pt);
                }
            }
        } else {
            while (points.length < numPoints) {
                points.push(next());
            }
        }
        return points;
    }

    static randomPointInTriangle(vertex1, vertex2, vertex3) {
        const edgeAB = vertex2.clone().sub(vertex1);
        const edgeAC = vertex3.clone().sub(vertex1);
        let r = Math.random();
        let s = Math.random();

        if (r + s >= 1) {
            r = 1 - r;
            s = 1 - s
        }
        return edgeAB.multiplyScalar(r).add(edgeAC.multiplyScalar(s)).add(vertex1)
        // random point in triangle
    }

    calculateArea() {
        let area = 0;
        this.triangles.forEach((triangle, i) => {
            area += triangle.getArea();
        });
        return area;
    }
}
