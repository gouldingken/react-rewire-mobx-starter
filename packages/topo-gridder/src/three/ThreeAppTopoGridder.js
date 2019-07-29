/**
 * Creates a new instance of ThreeAppTopoGridder.
 * @class
 * @returns An instance of ThreeAppTopoGridder.
 * @example
 * var instance = new ThreeAppTopoGridder();
 */
import {ThreeApp} from "colorizer-three";
import {BoxGeometry, DoubleSide, Matrix4, Mesh, MeshPhongMaterial, PlaneGeometry, Vector3} from "three-full";

export default class ThreeAppTopoGridder extends ThreeApp {

    constructor(holder, dataHandler, settings) {
        super(holder, dataHandler, settings);

        this.renderer.setClearColor('#969696');

    };
}
