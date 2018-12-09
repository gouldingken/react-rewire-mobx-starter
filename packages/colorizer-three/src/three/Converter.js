/**
 * Creates a new instance of Converter.
 * @class
 * @returns An instance of Converter.
 * @example
 * var instance = new Converter();
 */
import {Face3, Geometry, Line, Mesh, Vector3} from "three";

export default class Converter {

    constructor() {
    };

    static getLine(obj, lineMaterial) {
        let geometry = new Geometry();
        obj.vertices.forEach((vertex, i) => {
            geometry.vertices.push(new Vector3(vertex[0], vertex[1], vertex[2]));
        });
        let line = new Line(geometry, lineMaterial);
        line.rotateX(-Math.PI / 2);
        return line;
    }

    static getMesh(obj, meshMaterial) {
        let geometry = new Geometry();
        for (let i = 2; i < obj.vertices.length; i += 3)
            geometry.vertices.push(new Vector3(obj.vertices[i - 2], obj.vertices[i - 1], obj.vertices[i]))

        let k = 0;
        while (k < obj.faces.length) {
            // QUAD FACE
            if (obj.faces[k] === 1) {
                geometry.faces.push(new Face3(obj.faces[k + 1], obj.faces[k + 2], obj.faces[k + 3]));
                geometry.faces.push(new Face3(obj.faces[k + 1], obj.faces[k + 3], obj.faces[k + 4]));
                k += 5
            }
            // TRIANGLE FACE
            if (obj.faces[k] === 0) {
                geometry.faces.push(new Face3(obj.faces[k + 1], obj.faces[k + 2], obj.faces[k + 3]));
                k += 4
            }
        }
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        let mesh = new Mesh(geometry, meshMaterial);
        mesh.rotateX(-Math.PI / 2);
        return mesh;
    }
}
