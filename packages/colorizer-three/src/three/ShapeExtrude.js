import {ExtrudeBufferGeometry, Mesh, MeshLambertMaterial, Shape} from "three";
import HatchShader from "./shaders/HatchShader";

/**
 * Creates a new instance of ShapeExtrude.
 * @class
 * @returns An instance of ShapeExtrude.
 * @example
 * var instance = new ShapeExtrude();
 */
export default class ShapeExtrude {

    constructor(path, depth, color, hatch) {
        const shape = new Shape();
        path.forEach((pos, i) => {
            if (i === 0) {
                shape.moveTo(pos.x, pos.y);
            } else {
                shape.lineTo(pos.x, pos.y);
            }
        });

        const extrudeSettings = {
            steps: 1,
            depth: depth,
            bevelEnabled: false
        };

        const geometry = new ExtrudeBufferGeometry(shape, extrudeSettings);
        let material;
        if (hatch) {
            material = new HatchShader({color: color}).getMaterial();
        } else {
            material = new MeshLambertMaterial({color: color});
        }
        const mesh = new Mesh(geometry, material);

        //Note shapes are 2D and are extruded in the "Z" direction
        mesh.rotateX(-Math.PI / 2);
        this.mesh = mesh;
    };
}
